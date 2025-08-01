import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { json } from 'stream/consumers';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'defaultsecret',
      // passReqToCallback: false, // Remove or set to false unless needed
    });
  }

  async validate(payload: any) {
    // For debugging, print the payload
    console.log(`JWT payload: ${JSON.stringify(payload)}`);
    return { _id: payload.sub, email: payload.email };
  }
}