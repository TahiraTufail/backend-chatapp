import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'your_secret_key', // Change to env variable
    });
  }

  async validate(payload: any) {
    // Whatever we return becomes req.user
    return {
      id: payload.id, // main identifier
      email: payload.email,
      name: payload.name,
      phoneNumber: payload.phoneNumber, // needed for "cannot add yourself"
    };
  }
}
