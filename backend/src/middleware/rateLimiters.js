import rateLimit from 'express-rate-limit';

/**
 * strictResultLimiter
 * Limits requests to 5 attempts per 15 minutes per IP
 * Prevents brute-forcing Date of Birth
 */
export const strictResultLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per windowMs
  message: {
    success: false,
    message: 'Too many result check attempts. Please try again after 15 minutes.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
