import { ImapFlow } from "imapflow"

export const client = new ImapFlow({
    host : process.env.IMAP_HOST!,
    port : 993,
    auth : {
        user : process.env.EMAIL_USER!,
        pass : process.env.EMAIL_PASS!
    },
})
