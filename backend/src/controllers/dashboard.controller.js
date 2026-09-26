import { getDashboardStats } from '../services/dashboard.service.js';

export async function getDashboard(req, res) {
  res.json(await getDashboardStats());
}
