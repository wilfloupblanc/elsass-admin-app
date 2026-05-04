import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useSignInMutation, useGetAuthUserQuery } from '../../store/ApiSlice/adminApiSlice'
import './Login.scss'

export const Login = () => {
    const navigate = useNavigate()
    const [signIn, { isLoading, isError }] = useSignInMutation()
    const { refetch } = useGetAuthUserQuery()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [rememberMe, setRememberMe] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    useEffect(() => {
        async function loadCredentials() {
            const saved = await window.electronAPI.getCredentials()
            if (saved) {
                setEmail(saved.email)
                setPassword(saved.password)
                setRememberMe(true)
            }
        }
        loadCredentials()
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            await signIn({ email, password }).unwrap()

            if (rememberMe) {
                await window.electronAPI.saveCredentials({ email, password })
            } else {
                await window.electronAPI.clearCredentials()
            }

            await refetch()
            navigate('/')
        } catch (error) {
            console.error('Erreur de connexion', error)
        }
    }

    return (
        <section className="login">
            <article className="login__card">
                <div className="login__header">
                    <h1 className="login__title">Elsass SimRacing</h1>
                    <p className="login__subtitle">Administration</p>
                </div>
                <form className="login__form" onSubmit={handleSubmit}>
                    <div className="login__field">
                        <label className="login__label">Email</label>
                        <input
                            className="login__input"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@elsass-simracing.fr"
                            required
                        />
                    </div>
                    <div className="login__field">
                        <label className="login__label">Mot de passe</label>
                        <div className="login__password-wrapper">
                            <input
                                className="login__input"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                className="login__eye"
                                onClick={() => setShowPassword(prev => !prev)}
                            >
                                {showPassword ? (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                                        <line x1="1" y1="1" x2="23" y2="23"/>
                                    </svg>
                                ) : (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                        <circle cx="12" cy="12" r="3"/>
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                    <div className="login__remember">
                        <input
                            type="checkbox"
                            id="rememberMe"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                        />
                        <label htmlFor="rememberMe">Se souvenir de moi</label>
                    </div>
                    {isError && (
                        <p className="login__error">Email ou mot de passe incorrect</p>
                    )}
                    <button
                        className="login__submit"
                        type="submit"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Connexion...' : 'Se connecter'}
                    </button>
                </form>
            </article>
        </section>
    )
}