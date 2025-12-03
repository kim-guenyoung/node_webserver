import { loginUser, getMe } from '../services/auth.service.js';

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const result = await loginUser(email, password);
    res.json({ success: true, data: result });
  } catch (e) {
    res.status(401).json({ success: false, message: e.message });
  }
}

export async function me(req, res) {
  try {
    const user = await getMe(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
}
