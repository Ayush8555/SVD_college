import { getCache, setCache } from '../config/redis.js';

/**
 * cacheResult
 * Middleware to cache API responses for public result checking
 * TTL: 60 seconds (results don't change often once published)
 */
export const cacheResult = async (req, res, next) => {
    if (process.env.NODE_ENV !== 'production' && !process.env.FORCE_CACHE) {
        return next();
    }

    const { rollNumber, dateOfBirth, semester } = req.body;
    
    // Only cache if all required params are present to form unique key
    if (!rollNumber || !dateOfBirth) {
        return next();
    }

    const cacheKey = `result:${rollNumber}:${dateOfBirth}:${semester || 'all'}`;

    try {
        const cachedData = await getCache(cacheKey);
        
        if (cachedData) {
            // Return cached response
            return res.status(200).json({
                success: true,
                source: 'cache',
                data: cachedData
            }); 
        }

        // Intercept response to cache it
        const originalSend = res.json;
        res.json = function(body) {
            // Only cache successful responses
            if (body.success && body.data) {
                setCache(cacheKey, body.data, 300); // Cache for 5 minutes
            }
            originalSend.call(this, body);
        };

        next();
    } catch (error) {
        // Fallback to DB if cache fails
        console.error('Cache Middleware Error:', error);
        next();
    }
};
