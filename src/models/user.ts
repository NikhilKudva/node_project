import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(process.env.DATABASE_URL || '', {
  dialect: 'postgres',
  logging: false,
});

interface UserAttributes {
  id: number;
  name: string;
  email: string;
  password: string;
  created_at?: Date;  // Changed to match DB column name
  updated_at?: Date;  // Changed to match DB column name
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'created_at' | 'updated_at'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public name!: string;
  public email!: string;
  public password!: string;
  public created_at!: Date;  // Changed to match DB column name
  public updated_at!: Date;  // Changed to match DB column name
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    created_at: {  // Changed to match DB column name
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {  // Changed to match DB column name
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    }
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
    underscored: true,  // This tells Sequelize to use snake_case for column names
    createdAt: 'created_at',  // Specify the custom column name
    updatedAt: 'updated_at'   // Specify the custom column name
  }
);

export default User;
export { sequelize };