/**
 * @license
 * Copyright Andrey Chalkin <L2jLiga@gmail.com> (https://github.com/L2jLiga). All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/L2jLiga/fastify-decorators/blob/master/LICENSE
 */

import type { FastifyInstance } from 'fastify';
import type { ControllerConfig } from '../interfaces';
import type { InjectableClass } from '../interfaces/injectable-class';
import { ControllerType } from '../registry';
import { injectables } from '../registry/injectables';
import { CREATOR, INJECTABLES } from '../symbols';
import { injectControllerOptions } from './helpers/inject-controller-options';
import { ControllerTypeStrategies } from './strategies/controller-type';

function makeConfig(config?: string | ControllerConfig): ControllerConfig & { type: ControllerType } {
  if (typeof config === 'string') config = { route: config };

  return { type: ControllerType.SINGLETON, route: '/', ...config };
}

/**
 * Creates register method on controller to allow bootstrap it
 */
export function Controller(): ClassDecorator;
export function Controller(route: string): ClassDecorator;
export function Controller(config: ControllerConfig): ClassDecorator;
export function Controller(config?: string | ControllerConfig): unknown {
  return (controller: InjectableClass): void => {
    const { route, type } = makeConfig(config);

    injectControllerOptions(controller);

    controller[CREATOR].register = async (
      instance: FastifyInstance,
      injectablesMap = injectables,
      cacheResult = true,
    ) => {
      controller[INJECTABLES] = injectablesMap;
      controller.prototype[INJECTABLES] = injectablesMap;

      let controllerInstance;

      await instance.register(
        async (instance) => {
          controllerInstance = await ControllerTypeStrategies[type](instance, controller, injectablesMap, cacheResult);
        },
        { prefix: route },
      );

      return controllerInstance;
    };
  };
}
