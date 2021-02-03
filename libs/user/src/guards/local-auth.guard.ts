import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * 用户登录守卫
 *
 * @export
 * @class LocalAuthGuard
 * @extends {AuthGuard('local')}
 */
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}
