function UserCard({user}){
    const {name , email ,phone} = user;
    return(
    <div>
        <h1>{name}</h1>
        <p>{email}</p>
        <p>{phone}</p>
    </div>
    );
}
export default UserCard;