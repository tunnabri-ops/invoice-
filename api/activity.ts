import { getActivityHistory } from '../server/emailService';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  const activities = getActivityHistory();
  return res.status(200).json({ ok: true, activities });
}
