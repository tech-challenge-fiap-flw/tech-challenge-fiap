import { buildApp } from './app';

const app = buildApp();
const PORT = process.env.PORT ?? 3333;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
