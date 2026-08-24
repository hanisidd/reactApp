function UserCard({ user, onDelete }) {
    const { name, email, phone } = user;

    return (
        <div>
            <h1>{name}</h1>
            <p>{email}</p>
            <p>{phone}</p>

            <button onClick={() => onDelete(user.id)}>
                Delete
            </button>
        </div>
    );
}

export default UserCard;