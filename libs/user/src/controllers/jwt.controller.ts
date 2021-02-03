import { BaseController } from '@gkr/core';
import { Controller, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards';

/**
 * 添加JWT守卫的基础控制器
 *
 * @export
 * @abstract
 * @class JWTController
 * @extends {BaseController}
 */

@Controller()
@UseGuards(JwtAuthGuard)
export abstract class JWTController extends BaseController {}
