import { API } from '../lib/framework/index.js'
import User from './models/User.js'
import Account from './models/Account.js'


export const ACCOUNT = new API(Account)
export const USER = new API(User)
