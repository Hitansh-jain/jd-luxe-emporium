import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderDetails } = await req.json();
    
    console.log('Received order details:', orderDetails);
    
    const {
      customerName,
      customerPhone,
      customerAddress,
      customerEmail,
      products,
      totalAmount
    } = orderDetails;

    // Format products list
    const productsList = products.map((item: any) => 
      `${item.name} (Qty: ${item.quantity}) - ₹${item.price}`
    ).join('\n');

    // Create WhatsApp message
    const message = `🛍️ *NEW ORDER FROM JD JEWELLERS*

👤 *Customer Details:*
Name: ${customerName}
Phone: ${customerPhone}
Email: ${customerEmail || 'Not provided'}
Address: ${customerAddress}

💎 *Order Items:*
${productsList}

💰 *Total Amount:* ₹${totalAmount}

📅 *Order Time:* ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`;

    // URL encode the message
    const encodedMessage = encodeURIComponent(message);
    
    // WhatsApp number
    const whatsappNumber = '919079998370';
    
    // Create WhatsApp API URL (using WhatsApp Business API format)
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodedMessage}`;

    console.log('Order notification prepared successfully');
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Order received successfully',
        whatsappUrl 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error processing order:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});