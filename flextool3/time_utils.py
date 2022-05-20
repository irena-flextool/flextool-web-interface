import datetime
from django.utils import timezone


def naive_local_time(time_point, time_offset):
    """Converts UTC time point into naive local time.

    Args:
        time_point (datetime.datetime): UTC time point
        time_offset (int): timezone offset in seconds
    """
    offset_delta = datetime.timedelta(seconds=time_offset)
    local_timezone = datetime.timezone(offset_delta)
    return timezone.make_naive(time_point, local_timezone)
