import 'reflect-metadata'

import * as dotenv from 'dotenv'
dotenv.config({ path: `${__dirname}/.env` })

import './container'

import { main } from './main'

main()
