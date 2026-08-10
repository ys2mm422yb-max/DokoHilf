# dokohilf-conversation-router

Completion-aware public wrapper for DokoHilf.

It only handles deterministic completion/follow-up behavior for already approved guides. Every other request is forwarded to `dokohilf-chat-router`. It does not store conversations, does not create accounts, and does not introduce new fachliche click paths.

The function remains public (`verify_jwt = false`) because the public DokoHilf app is account-free. Sensitive-data handling is preserved by forwarding suspicious input into the existing protected router chain, where the established block is applied.
