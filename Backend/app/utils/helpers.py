import re
import uuid
from typing import Optional, List
from datetime import datetime, timedelta


def is_valid_email(email: str) -> bool:
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


def is_university_email(email: str) -> bool:
    """Check if email is from a university domain"""
    university_domains = [
        '.edu', '.ac.uk', '.edu.pk', '.ac.in', '.edu.au',
        '.ac.za', '.edu.sg', '.ac.nz', '.edu.my', '.ac.th'
    ]
    return any(email.lower().endswith(domain) for domain in university_domains)


def generate_verification_token() -> str:
    """Generate a random verification token"""
    return str(uuid.uuid4())


def sanitize_filename(filename: str) -> str:
    """Sanitize filename for safe storage"""
    # Remove or replace unsafe characters
    filename = re.sub(r'[^\w\-_\.]', '_', filename)
    # Limit length
    if len(filename) > 255:
        name, ext = filename.rsplit('.', 1) if '.' in filename else (filename, '')
        filename = name[:250] + ('.' + ext if ext else '')
    return filename


def extract_keywords(text: str, min_length: int = 3) -> List[str]:
    """Extract keywords from text for search indexing"""
    if not text:
        return []
    
    # Convert to lowercase and split into words
    words = re.findall(r'\b\w+\b', text.lower())
    
    # Filter out short words and common stop words
    stop_words = {
        'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
        'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had',
        'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might',
        'can', 'this', 'that', 'these', 'those', 'a', 'an'
    }
    
    keywords = [
        word for word in words 
        if len(word) >= min_length and word not in stop_words
    ]
    
    # Remove duplicates while preserving order
    return list(dict.fromkeys(keywords))


def format_price(price: float, currency: str = 'USD') -> str:
    """Format price for display"""
    if currency == 'USD':
        return f"${price:,.2f}"
    elif currency == 'PKR':
        return f"Rs. {price:,.0f}"
    else:
        return f"{price:,.2f} {currency}"


def calculate_time_ago(timestamp: datetime) -> str:
    """Calculate human-readable time difference"""
    now = datetime.utcnow()
    diff = now - timestamp
    
    if diff.days > 0:
        if diff.days == 1:
            return "1 day ago"
        elif diff.days < 7:
            return f"{diff.days} days ago"
        elif diff.days < 30:
            weeks = diff.days // 7
            return f"{weeks} week{'s' if weeks > 1 else ''} ago"
        elif diff.days < 365:
            months = diff.days // 30
            return f"{months} month{'s' if months > 1 else ''} ago"
        else:
            years = diff.days // 365
            return f"{years} year{'s' if years > 1 else ''} ago"
    
    hours = diff.seconds // 3600
    if hours > 0:
        return f"{hours} hour{'s' if hours > 1 else ''} ago"
    
    minutes = diff.seconds // 60
    if minutes > 0:
        return f"{minutes} minute{'s' if minutes > 1 else ''} ago"
    
    return "Just now"


def validate_image_url(url: str) -> bool:
    """Validate if URL points to an image"""
    if not url:
        return False
    
    # Basic URL validation
    url_pattern = r'^https?://.+'
    if not re.match(url_pattern, url):
        return False
    
    # Check for image extensions
    image_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp']
    return any(url.lower().endswith(ext) for ext in image_extensions)


def generate_slug(text: str, max_length: int = 50) -> str:
    """Generate URL-friendly slug from text"""
    # Convert to lowercase and replace spaces with hyphens
    slug = re.sub(r'[^\w\s-]', '', text.lower())
    slug = re.sub(r'[-\s]+', '-', slug)
    
    # Trim to max length
    if len(slug) > max_length:
        slug = slug[:max_length].rstrip('-')
    
    return slug


def mask_email(email: str) -> str:
    """Mask email for privacy (show first 2 chars and domain)"""
    if '@' not in email:
        return email
    
    local, domain = email.split('@', 1)
    if len(local) <= 2:
        return email
    
    masked_local = local[:2] + '*' * (len(local) - 2)
    return f"{masked_local}@{domain}"


def validate_phone_number(phone: str) -> bool:
    """Basic phone number validation"""
    if not phone:
        return False
    
    # Remove all non-digit characters
    digits = re.sub(r'\D', '', phone)
    
    # Check if it's a reasonable length (7-15 digits)
    return 7 <= len(digits) <= 15


def get_file_extension(filename: str) -> Optional[str]:
    """Get file extension from filename"""
    if '.' not in filename:
        return None
    return filename.rsplit('.', 1)[1].lower()


def is_allowed_file_type(filename: str, allowed_extensions: List[str]) -> bool:
    """Check if file type is allowed"""
    extension = get_file_extension(filename)
    return extension in [ext.lower().lstrip('.') for ext in allowed_extensions]

