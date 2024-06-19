export class AuthType {
  accessToken: string;

  tokenType = 'Bearer';

  expiresIn: number;

  refreshToken?: string;

  idToken?: string;

  /**
   * The "constructor"
   *
   * @param partial
   */
  constructor(partial?: Partial<AuthType>) {
    Object.assign(this, partial);
  }
}
