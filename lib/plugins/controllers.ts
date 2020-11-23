/**
 * @license
 * Copyright Andrey Chalkin <L2jLiga@gmail.com> (https://github.com/L2jLiga). All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/L2jLiga/fastify-decorators/blob/master/LICENSE
 */

import { ErrorHandler, Handler, Hook, InjectableController } from '../interfaces';
import { FastifyInstance } from 'fastify';
import { Injectables } from '../interfaces/injectable-class';
import { injectControllerOptions } from '../decorators/helpers/inject-controller-options';
import { CREATOR, ERROR_HANDLERS, HANDLERS, HOOKS, INJECTABLES } from '../symbols';
import { injectables } from '../registry/injectables';
import { ControllerTypeStrategies } from '../decorators/strategies/controller-type';
import { ControllerType } from '../registry';
import { ensureErrorHandlers, ensureHandlers, ensureHooks } from '../decorators/helpers/class-properties';

/**
 * @experimental this API is not stable and can change in future
 */
export { InjectableController, Injectables, Handler, Hook, ErrorHandler };

/**
 * @experimental this API is not stable and can change in future
 *
 * @param route on which controller should be available
 * @param decorateFn
 */
export function decorateController(route: string, decorateFn: (target: InjectableController, instance: FastifyInstance, injectablesMap: Injectables) => void): ClassDecorator {
    return target => {
        injectControllerOptions(target);

        (target)[CREATOR].register = async (instance: FastifyInstance, injectablesMap = injectables, cacheResult = true) => {
            target[INJECTABLES] = injectablesMap;
            target.prototype[INJECTABLES] = injectablesMap;

            decorateFn(target, instance, injectablesMap);

            await instance.register(async instance => ControllerTypeStrategies[ControllerType.SINGLETON](instance, target, injectablesMap, cacheResult), { prefix: route });
        };
    };
}

/**
 * @experimental this API is not stable and can change in future
 *
 * @param target
 * @param handler
 */
export function addHandler(target: Record<keyof unknown, unknown>, handler: Handler): void {
    ensureHandlers(target);
    target[HANDLERS].push(handler);
}

/**
 * @experimental this API is not stable and can change in future
 *
 * @param target
 * @param hook
 */
export function addHook(target: Record<keyof unknown, unknown>, hook: Hook): void {
    ensureHooks(target);
    target[HOOKS].push(hook);
}

/**
 * @experimental this API is not stable and can change in future
 *
 * @param target
 * @param errorHandler
 */
export function addErrorHandler(target: Record<keyof unknown, unknown>, errorHandler: ErrorHandler): void {
    ensureErrorHandlers(target);
    target[ERROR_HANDLERS].push(errorHandler);
}
