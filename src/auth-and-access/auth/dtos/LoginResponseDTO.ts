export interface LoginResponseDTO {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    name: string;
    email: string;
    type: string;
  };
}
