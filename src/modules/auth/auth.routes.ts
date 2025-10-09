import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { UserMySqlRepository } from '../user/infra/UserMySqlRepository';

const router = Router();
const repo = new UserMySqlRepository();

router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'email and password required' });
    }

    const user = await repo.findByEmail(email);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const data = user.toJSON();
    const ok = await bcrypt.compare(password, data.password);

    if (!ok) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const secret = process.env.JWT_SECRET || 'dev-secret';

    const token = jwt.sign(
      { sub: data.id, email: data.email, type: data.type },
      secret,
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (err) {
    next(err);
  }
});

export const authRouter = router;
