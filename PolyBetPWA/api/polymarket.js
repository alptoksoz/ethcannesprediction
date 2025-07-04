// api/polymarket.js
export default async function handler(req, res) {
  // CORS headers - düzeltildi
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Max-Age', '86400');
  
  // OPTIONS request için
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Sadece GET isteklerini kabul et
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  
  try {
    // Query parametrelerini al
    const { 
      limit = 10, 
      order = 'volume', 
      ascending = 'false',
      volume_num_min = 100000,
      start_date_max = '2025-12-31',
      end_date_min = '2026-01-01'
    } = req.query;
    
    // Polymarket API URL'ini oluştur
    const API_URL = `https://gamma-api.polymarket.com/markets?limit=${limit}&order=${order}&ascending=${ascending}&active=true&closed=false&volume_num_min=${volume_num_min}&start_date_max=${start_date_max}&end_date_min=${end_date_min}`;
    
    console.log('🔄 Fetching from Polymarket API:', API_URL);
    
    // Polymarket API'sine istek gönder
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'User-Agent': 'PolyBetPWA/1.0',
        'Accept': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`Polymarket API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    console.log('✅ Successfully fetched', Array.isArray(data) ? data.length : 'unknown', 'markets');
    
    // Cache headers ekle (5 dakika)
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
    
    // Veriyi döndür
    res.status(200).json(data);
    
  } catch (error) {
    console.error('❌ API Proxy Error:', error);
    
    // Hata durumunda fallback response
    res.status(500).json({ 
      error: 'Failed to fetch markets',
      message: error.message,
      fallback: true,
      data: [] // Frontend fallback data kullanacak
    });
  }
}