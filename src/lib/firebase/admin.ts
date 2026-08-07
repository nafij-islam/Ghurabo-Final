import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';

const FALLBACK_PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDZ3MWxgbj/9Udg\nH1cAMrtV703obPjDraBNtEZOcZhcwBIV9/g95etcvOHdn61K3Hb136SXrJP7OSfs\n5oPJwouIcdQP/w1q9tC69mJAo2Rhs+Iu3tPgTRCSQWIHjCXdcDWe/rNNgl0YEoB2\n/ZrkLdX/w0CwO6ZN3oI62oOMKDeigIMTeISFG5A7C7+ZK9VyNcbKDj3BJhQlil8Z\nSHygIKaj+FCfOUcZkFQivhTDmCJvX6lfcmbtXPpkGBC0sGREnaKykniR1WwMcePr\na0U7YP/BErnRW0WldhjxEA1P4P0jnQ6WWN07UNN6YnOx9koATKbLP3ORZkOaZKIz\nMRFM9IpnAgMBAAECggEAGgdsfza2ea4+ZteXt2hYRX4f2sMaPZbC7kW5mKmtwHca\nMhG8UPjlU+ElQytOswEAHYQo0A5IZ91+TamE2Vgq/5RJ99dLLRpr+cpyFrLuzVWG\nkn8A5W2Pq0mwgqJV68z6OxLHLV2D7dpYCt9l4Bkx1irn0aZuyiLpgEqXKOmtK/bi\nFbXYge0qJx3+d39V9Pvxjuv8qgiFrEyUZ92AdVvPtZp0imTLsAMx4Aax6aNlwsl7\nPzumvUGHdJIxAqsHioShotQaSc0M/uArYGy/j4CDtP7QIENO/2UBqY0d35D1JiIu\nyzO3jK6j3xtxIMGeqrfjT0VsO3taFddgka6eNlhJMQKBgQD/xY94df2L2Z1J4C9S\n9pn/13JMm0AcWuvnHbdHFB/1SAIIrw0yT27YfLcmoh+CKgWM21osOepvnzw6TEK5\nIbUswdI/sWPqmRvKPZqmWQkx0gytDVuzJOJ5pJx1rmH7Qe7P92m9Vpt2sbT/0Bgm\n0fNyo0SUfXr++Au6lAYI1B+4FQKBgQDaDozXO1TPmh6RRKozvk8fdPICFVDjsKav\nSaU1MRo5pm9xbsm7kmPbZ378xGEKQuRX/0JXT9m0F4XMcMwEzNmL/o59V7xJBZMZ\nuZS5bJLxQpMO9CS82geF+YMbwsCR1WjFRyolkbkSUECjBYvD9nzXEah/L+tY/ycQ\nhV2l5gP7iwKBgQCv7x05JzA4un/PCT6EOszDh1dACqqW1pPebjpb0iQJfHapsn/J\nU4pTr7XsBSjXSEB5G4lzUoNINKghEcPzxJPzLX+KAGNSQ+8xth5ivmvssSe3AbFK\nEN0X/3sAF+ueAURcGTvK2YAmrSZrsKBsU466FERgP9ATAlxPAvMDr6YB4QKBgChj\np4y6TaRCbMUFje0Vo/w0ohrmrdvuvYEcSACJPs1M2bmOBsm6fMqH6gqRqVPIPhla\ni4Q2oyFrdfn/Lpr5ApaeqO/oj1SLNsr+B+Esji8n4KtVZ3SfgeM76x/6O8cHW2en\nHdRloH0W5lIL1e6POmJvv+EHFDWg1TCHM2hmKXivAoGABsz+xS6BaJQP/aUQBnqW\nam/CZDjVyNE04Rp8uloh3TMX/+ldYlvytNl/tPL/m4bu517e/RbyIpjlceCHWHrp\nJ+r8nFp6vAhpYjx0BfbiRCOxiKM59dQmsDx7bEZ1Rdf4/xbYnVzsq/HQ97IMHZwO\nYb6noMVtsUsIQ+ZcPS3/LGY=\n-----END PRIVATE KEY-----\n`;

let adminAuthInstance: Auth | null = null;

export function getAdminAuth(): Auth {
  if (adminAuthInstance) {
    return adminAuthInstance;
  }

  if (getApps().length > 0) {
    adminAuthInstance = getAuth(getApp());
    return adminAuthInstance;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID || 'ghurabo-a4960';
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || 'firebase-adminsdk-fbsvc@ghurabo-a4960.iam.gserviceaccount.com';
  let privateKey = process.env.FIREBASE_PRIVATE_KEY || FALLBACK_PRIVATE_KEY;

  if (privateKey) {
    privateKey = privateKey.trim();
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
      privateKey = privateKey.slice(1, -1);
    }
    privateKey = privateKey.replace(/\\n/g, '\n');
  }

  const app = initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });

  adminAuthInstance = getAuth(app);
  return adminAuthInstance;
}

// Backward compatibility export
export const adminAuth = {
  verifyIdToken: async (idToken: string) => {
    const auth = getAdminAuth();
    return await auth.verifyIdToken(idToken);
  },
};
