import User from '../models/user';
import { Op } from 'sequelize';

const markUsersInactive = async () => {
    try {
      const currentTime = new Date();
      const twoDaysAgo = new Date(currentTime.getTime() - 48 * 60 * 60 * 1000);
  
      // Update users where created_at is older than 48 hours
      const [updatedCount] = await User.update(
        { status: 'inactive' },
        {
          where: {
            created_at: { [Op.lt]: twoDaysAgo },
            status: 'active', // Only update active users
          },
        }
      );
  
      console.log(`Cron Job: ${updatedCount} users marked as inactive.`);
    } catch (error) {
      console.error('Error in cron job:', error);
    }
  };
  
 export default markUsersInactive;
    