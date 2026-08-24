import { useState } from "react";

function Login() {
    const [login,setLogin] = useState({
        email:"",
        password:"",
    });
    const [errors, setErrors] = useState({});
    const form =(event) =>{
        const {name , value} = event.target;
        setLogin(prevLogin =>({
            ...prevLogin,
            [name]:value,
    }) );
    setErrors(prevErrors =>({
        ...prevErrors,
        ['name']:'',
    }))
    }
    const validate = ()=>{
        const errors = {};
        if(!login.email){
            errors.email="email is required"
        }
        if(!login.password){
            errors.password = "password is required"
        }else if(login.password.length<6){
            errors.password = "passwprd should minumn have 6 characters";
        }
        return errors;
    }
    const submitForm=(event)=>{
        event.preventDefault();
        
        const validationErrors = validate();
        setErrors(validationErrors);
        if(Object.keys(validationErrors).length > 0 ){
            return
        }
        console.log(login);
    }
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-full max-w-md p-8 border border-gray-200 rounded-xl shadow-md">
                <h1 className="text-3xl font-bold">Admin Login</h1>

                <form className="space-y-4" onSubmit={submitForm}>
                    <div>
                        <label>Email</label>
                        <input type="email" name="email" onChange={form} className="w-full border border-gray-300 rounded-md p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none" />
                        {errors.email && (<p className="text-red-500 text-sm">{errors.email}</p>)}
                    </div>

                    <div>
                        <label>Password</label>
                        <input type="password" name="password" onChange={form} className="w-full border border-gray-300 rounded-md p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none" />
                        {errors.password && (<p className="text-red-500 text-sm">{errors.password}</p>)}
                    </div>

                    <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition">
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login;
