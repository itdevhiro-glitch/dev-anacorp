const {onCall,HttpsError}=require('firebase-functions/v2/https');
const admin=require('firebase-admin'); admin.initializeApp();
const ROOT_EMAIL='root@ana.studio';
exports.provisionUser=onCall(async req=>{if(!req.auth)throw new HttpsError('unauthenticated','Sign in required');const caller=await admin.auth().getUser(req.auth.uid);if((caller.email||'').toLowerCase()!==ROOT_EMAIL)throw new HttpsError('permission-denied','Only bootstrap root can provision accounts');const {email,password,displayName,role,permissions=[],vendorId=null}=req.data||{};if(!email||!password||!displayName||!['admin','staff','vendor','talent'].includes(role))throw new HttpsError('invalid-argument','Invalid account data');if(String(email).toLowerCase()===ROOT_EMAIL)throw new HttpsError('already-exists','Root account is reserved');const u=await admin.auth().createUser({email,password,displayName,emailVerified:false});await admin.firestore().doc(`users/${u.uid}`).set({displayName,email:email.toLowerCase(),role,permissions,vendorId,status:'active',createdAt:admin.firestore.FieldValue.serverTimestamp(),createdBy:req.auth.uid});
 const dirCollection={vendor:'vendors',staff:'staff',talent:'talents'}[role]||null;
 if(dirCollection){
   const dirRef=admin.firestore().doc(`${dirCollection}/${u.uid}`);
   await dirRef.set({
     linkedUid:u.uid,
     userUid:u.uid,
     displayName,
     email:email.toLowerCase(),
     status:'active',
     role,
     ...(role==='vendor'?{vendorId:u.uid}:{}),
     createdAt:admin.firestore.FieldValue.serverTimestamp(),
     updatedAt:admin.firestore.FieldValue.serverTimestamp(),
     createdBy:req.auth.uid
   },{merge:true});
   if(role==='vendor'){
     await admin.firestore().doc(`users/${u.uid}`).set({vendorId:u.uid},{merge:true});
   }
 }
 return {uid:u.uid,email:u.email,directory:dirCollection};});


exports.syncUserDirectories=onCall(async req=>{
  if(!req.auth) throw new HttpsError('unauthenticated','Sign in required');
  const caller=await admin.auth().getUser(req.auth.uid);
  if((caller.email||'').toLowerCase()!==ROOT_EMAIL)
    throw new HttpsError('permission-denied','Only bootstrap root can sync directories');

  const snap=await admin.firestore().collection('users').get();
  const batch=admin.firestore().batch();
  let synced=0;
  for(const d of snap.docs){
    const u=d.data();
    const col={vendor:'vendors',staff:'staff',talent:'talents'}[u.role];
    if(!col) continue;
    const ref=admin.firestore().doc(`${col}/${d.id}`);
    batch.set(ref,{
      linkedUid:d.id,userUid:d.id,displayName:u.displayName||u.email||d.id,
      email:u.email||'',status:u.status||'active',role:u.role,
      ...(u.role==='vendor'?{vendorId:d.id}:{}),
      updatedAt:admin.firestore.FieldValue.serverTimestamp(),
      createdBy:req.auth.uid
    },{merge:true});
    if(u.role==='vendor') batch.set(d.ref,{vendorId:d.id},{merge:true});
    synced++;
  }
  await batch.commit();
  return {synced};
});
