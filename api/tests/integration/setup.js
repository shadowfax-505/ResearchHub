require('dotenv').config();
const {pool,testConnection}=require('../../src/config/database');
if(!/^RH_QA_[A-Z0-9_]+$/.test(process.env.DB_USER||'')){
  throw new Error('Integration tests require a separate RH_QA_* Oracle schema. Tests write data and never run on the application schema.');
}
if (process.env.SMTP_HOST) throw new Error('Integration QA requires SMTP_HOST unset to prevent outbound test mail.');
beforeAll(async()=>{await testConnection();});
afterAll(async()=>{await pool.end();});
