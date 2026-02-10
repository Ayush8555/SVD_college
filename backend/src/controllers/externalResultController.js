import axios from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';
import * as cheerio from 'cheerio';

export const fetchExternalResult = async (req, res) => {
    const { rollNo, dob, targetUrl } = req.body;

    if (!rollNo || !dob) {
        return res.status(400).json({ success: false, message: 'Roll Number and Date of Birth are required.' });
    }

    const jar = new CookieJar();
    const client = wrapper(axios.create({ jar }));

    try {
        // Step 1: Login Flow (Required for both initial list and detail view)
        // 1a. GET initial page
        const initialUrl = 'https://vbspuresult.org.in/Home/SemesterResult?SemesterType=Odd&Session=2025-26';
        await client.get(initialUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        // 1b. POST credentials
        const postUrl = 'https://vbspuresult.org.in/Home/SemesterResult';
        const formData = new URLSearchParams();
        formData.append('RollNo', rollNo);
        formData.append('Password', dob);

        const postResponse = await client.post(postUrl, formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Referer': initialUrl,
                'Origin': 'https://vbspuresult.org.in',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            maxRedirects: 5
        });

        // Check login success
        const $ = cheerio.load(postResponse.data);
        if ($('input[name="RollNo"]').length > 0) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid Roll Number or Date of Birth. Please check your details.' 
            });
        }

        // --- SCENARIO 1: FETCHING SPECIFIC MARK SHEET ---
        if (targetUrl) {
            // If strict session is enforced, we are now logged in.
            // We can fetch the specific target URL.
            // Ensure targetUrl is absolute or relative to domain
            const finalTarget = targetUrl.startsWith('http') 
                ? targetUrl 
                : `https://vbspuresult.org.in${targetUrl.startsWith('/') ? '' : '/'}${targetUrl}`;

            const detailResponse = await client.get(finalTarget, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            });

            // Return the HTML of the marksheet
            return res.status(200).json({
                success: true,
                data: {
                    type: 'detail',
                    htmlContent: detailResponse.data
                }
            });
        }

        // --- SCENARIO 2: PARSING RESULT LIST (INITIAL VIEW) ---
        
        const studentInfo = {};
        const results = [];
        
        // Extract generic text that usually appears at top
        // Finding the table with result data.
        // Based on screenshot, there is a table with class (likely) and columns.
        // We look for the table containing "View Result"
        
        const mainTable = $('table').filter((i, el) => $(el).text().includes('View Result'));
        
        if (mainTable.length > 0) {
            // Process rows
            mainTable.find('tr').each((i, row) => {
                const cells = $(row).find('td');
                if (cells.length > 0) {
                    // Extract row data
                    // Assuming columns: S.No | Enroll/Roll | Name | Course | Type | Year | SGPA | Image | View
                    
                    // The screenshot shows combined columns for some (Roll/Enroll)
                    // Let's just grab text safely
                    const rowData = {
                        sNo: $(cells[0]).text().trim(),
                        rollNo: $(cells[1]).text().trim(),
                        name: $(cells[2]).text().trim(),
                        course: $(cells[3]).text().trim(),
                        semester: $(cells[5]).text().trim(), // Year/Sem
                        status: $(cells[4]).text().trim(),
                    };

                    // Extract Link
                    const linkAnchor = $(cells).find('a').filter((i, el) => $(el).text().trim().toLowerCase().includes('view result'));
                    if (linkAnchor.length > 0) {
                        rowData.viewLink = linkAnchor.attr('href');
                        results.push(rowData);
                    }
                }
            });
        }

        // Try to extract generic Student Name headers if table parsing didn't get it (or to confirm)
        // Usually found in some div or h tags
        const bodyText = $.text();
        // Fallback or specific extraction can be added here if we had the exact HTML
        
        return res.status(200).json({
            success: true,
            data: {
                type: 'list',
                student: studentInfo,
                results: results,
                // debugHtml: postResponse.data // Uncomment if debugging needed
            }
        });

    } catch (error) {
        console.error('External Result Proxy Error:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch results from the external portal. Please try again later.' 
        });
    }
};
