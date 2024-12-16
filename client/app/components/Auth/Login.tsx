'use client'

import React, {FC, useState} from 'react'
import {useFormik} from "formik";
import * as Yup from "yup";
import {styles} from "../../../app/styles/style"

type Props = {
    setRoute: (route: string) => void;
}

const schema = Yup.object().shape({
    email: Yup.string().email("Invalid email!").required("Please enter a valid email address!"),
    password: Yup.string().required("Please enter a valid password!").min(6),
})

const Login:FC<Props> = (props: Props) => {
    const [show, setShow] = useState(false);

    const formik = useFormik({
        initialValues: {email:"", password:""},
        validationSchema: schema, 
        onSubmit: async({email, password}) => {
            console.log(email, password);
        }
    })

    const {errors, touched, values, handleChange, handleSubmit} = formik;

  return (
    <div className='w-full'>
        <h1 className={`${styles.title}`}>
            Login with CodeXBuddy01
        </h1>
        <form onSubmit={handleSubmit}>
            <label className={`${styles.label}`} htmlFor="email">
                Enter your Email
            </label>
        </form>
    </div>
  )
}

export default Login