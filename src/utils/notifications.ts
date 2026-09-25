import { supabase } from '../lib/supabase';

export interface ProductNotification {
  product_id: number;
  product_name: string;
  product_image: string;
  created_at: string;
}

/**
 * Send notification to all registered users when a new product is added
 * This creates notification records in the database
 * In production, you would integrate with an email service like SendGrid, Mailgun, etc.
 */
export async function notifyNewProduct(productId: number, productName: string, productImage: string) {
  try {
    // Get all registered users
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, email, name')
      .eq('role', 'user');

    if (usersError) throw usersError;

    if (!users || users.length === 0) {
      console.log('No users to notify');
      return;
    }

    // Create notification for each user
    const notifications = users.map(user => ({
      user_id: user.id,
      type: 'new_product',
      title: 'New Product Added!',
      message: `${productName} has been added to our store. Check it out now!`,
      reference_id: productId.toString(),
      product_image: productImage,
      is_read: false,
    }));

    const { error: insertError } = await supabase
      .from('notifications')
      .insert(notifications);

    if (insertError) throw insertError;

    console.log(`Notifications sent to ${users.length} users`);

    // TODO: In production, integrate with email service
    // For now, we'll just log the emails that would be sent
    /*
    users.forEach(user => {
      sendEmail({
        to: user.email,
        subject: `New Product: ${productName}`,
        html: `
          <h1>New Product Added!</h1>
          <p>Hi ${user.name},</p>
          <p>${productName} has been added to our store.</p>
          <img src="${productImage}" alt="${productName}" style="max-width: 300px;" />
          <p>Check it out now!</p>
        `
      });
    });
    */

  } catch (error) {
    console.error('Error sending product notifications:', error);
  }
}

/**
 * Send email notification (placeholder for email service integration)
 * In production, integrate with SendGrid, Mailgun, AWS SES, etc.
 */
export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  // TODO: Implement actual email sending
  // Example with SendGrid:
  /*
  const msg = {
    to,
    from: 'noreply@vastraelegance.com',
    subject,
    html,
  };
  
  await sgMail.send(msg);
  */
  
  console.log('Email would be sent to:', to);
  console.log('Subject:', subject);
  console.log('HTML:', html);
}
