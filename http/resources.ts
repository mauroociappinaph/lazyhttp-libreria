/**
 * Símbolos predefinidos para usar con los resource accessors
 *
 * Ejemplo de uso:
 * ```
 * import { User, Product } from 'httplazy/resources';
 *
 * // Usar el símbolo directamente con el resource accessor
 * const users = await http.get[User]();
 * const product = await http.getById[Product]('123');
 * await http.post[User]({ name: 'John', email: 'john@example.com' });
 * ```
 */

// Creación de símbolos para entidades comunes
export const User = Symbol('User');
export const Product = Symbol('Product');
export const Category = Symbol('Category');
export const Order = Symbol('Order');
export const Customer = Symbol('Customer');
export const Post = Symbol('Post');
export const Comment = Symbol('Comment');
export const File = Symbol('File');
export const Tag = Symbol('Tag');
export const Role = Symbol('Role');
export const Permission = Symbol('Permission');
export const Group = Symbol('Group');
export const Setting = Symbol('Setting');
export const Notification = Symbol('Notification');
export const Message = Symbol('Message');
export const Event = Symbol('Event');
export const Task = Symbol('Task');
export const Project = Symbol('Project');
export const Team = Symbol('Team');
export const Payment = Symbol('Payment');
export const Subscription = Symbol('Subscription');
export const Invoice = Symbol('Invoice');
export const Address = Symbol('Address');
export const Review = Symbol('Review');
export const Feedback = Symbol('Feedback');
export const Metric = Symbol('Metric');
export const Log = Symbol('Log');
export const Report = Symbol('Report');
export const Dashboard = Symbol('Dashboard');
export const Profile = Symbol('Profile');
export const Account = Symbol('Account');

/**
 * Registro de símbolos para uso interno
 */
export const resourceSymbols = {
  User,
  Product,
  Category,
  Order,
  Customer,
  Post,
  Comment,
  File,
  Tag,
  Role,
  Permission,
  Group,
  Setting,
  Notification,
  Message,
  Event,
  Task,
  Project,
  Team,
  Payment,
  Subscription,
  Invoice,
  Address,
  Review,
  Feedback,
  Metric,
  Log,
  Report,
  Dashboard,
  Profile,
  Account
};

/**
 * Crea un símbolo para un recurso personalizado
 * @param name Nombre del recurso en PascalCase (ej: 'ProductVariant')
 * @returns Símbolo para usar con el resource accessor
 */
export function createResource(name: string): symbol {
  return Symbol(name);
}
