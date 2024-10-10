'use server'
import arbitratorDecided from './arbitratorDecided'
import bet from './bet'
import counterpartyAccepted from './counterpartyAccepted'
import createPaymentTransaction from './createPaymentTransaction'
import initial from './initial'

const handlers = {
    initial,
    bet,
    counterpartyAccepted,
    arbitratorDecided,
    createPaymentTransaction,
}

export default async function getHandlers() {
    return handlers
}
