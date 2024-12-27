export const jwtConstants = {
  secret: process.env.JWT_SECRET || 'defaultSecret',  // Si no encuentra el JWT_SECRET en el env, usa 'defaultSecret'
};
