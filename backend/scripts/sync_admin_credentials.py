from sqlalchemy import select

from app.core.config import settings
from app.core.security import get_password_hash
from app.db.session import SessionLocal
from app.models import AdminUser


def main() -> None:
    target_email = settings.admin_default_email.strip().lower()
    target_password_hash = get_password_hash(settings.admin_default_password)

    with SessionLocal() as session:
        admin = session.scalar(select(AdminUser).where(AdminUser.email == target_email))
        if admin:
            admin.password_hash = target_password_hash
            admin.is_active = True
            session.add(admin)
            session.commit()
            print(f"Admin password synced: {admin.email}")
            return

        first_admin = session.scalar(select(AdminUser).order_by(AdminUser.id.asc()))
        if first_admin:
            old_email = first_admin.email
            first_admin.email = target_email
            first_admin.password_hash = target_password_hash
            first_admin.is_active = True
            session.add(first_admin)
            session.commit()
            print(f"Admin credentials reassigned: {old_email} -> {target_email}")
            return

        user = AdminUser(
            email=target_email,
            password_hash=target_password_hash,
            is_active=True,
        )
        session.add(user)
        session.commit()
        print(f"Admin created from env: {target_email}")


if __name__ == "__main__":
    main()
