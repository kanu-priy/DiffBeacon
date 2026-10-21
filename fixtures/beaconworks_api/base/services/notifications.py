class NotificationDispatcher:
    def send_email(self, employee_id: int, message: str):
        # Email delivery stub
        return True

    def send_slack(self, employee_id: int, message: str):
        # Slack webhook stub
        return True

    def send_sms(self, employee_id: int, message: str):
        # SMS stub
        return True


_dispatcher = NotificationDispatcher()


def dispatch_notification(channel: str, *args, **kwargs):
    """
    DYNAMIC DISPATCH:
    DiffBeacon AST engine recognizes this as an unresolved dynamic call.
    Static analysis cannot establish which handler is invoked because 'channel'
    is computed or passed dynamically at runtime.
    """
    method_name = f"send_{channel}"
    handler = getattr(_dispatcher, method_name, None)
    if not handler:
        raise ValueError(f"Unsupported notification channel: {channel}")
    return handler(*args, **kwargs)
