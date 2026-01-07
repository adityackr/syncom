import arcjet, { sensitiveInfo, slidingWindow } from '@/lib/arcjet';
import { KindeUser } from '@kinde-oss/kinde-auth-nextjs';
import { base } from '../base.middleware';

const buildWriteAj = () =>
	arcjet
		.withRule(
			slidingWindow({
				mode: 'LIVE',
				interval: '1m',
				max: 40,
			})
		)
		.withRule(
			sensitiveInfo({
				mode: 'LIVE',
				deny: ['CREDIT_CARD_NUMBER', 'PHONE_NUMBER'],
			})
		);

export const writeSecurityMiddleware = base
	.$context<{ request: Request; user: KindeUser<Record<string, unknown>> }>()
	.middleware(async ({ context, next, errors }) => {
		const decision = await buildWriteAj().protect(context.request, {
			userId: context.user.id,
		});

		if (decision.isDenied()) {
			if (decision.reason.isRateLimit()) {
				throw errors.RATE_LIMITED({
					message: 'Too many impactful requests. Please slow down.',
				});
			}

			if (decision.reason.isSensitiveInfo()) {
				throw errors.BAD_REQUEST({
					message:
						'Sensitive information detected. Please remove PII (e.g. phone number, credit card number).',
				});
			}

			throw errors.FORBIDDEN({
				message: 'Request Blocked!',
			});
		}

		return next();
	});
