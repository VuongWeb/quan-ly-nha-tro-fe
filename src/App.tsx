import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SignIn from './feature/user/signIn';
import SignUpPage from './feature/user/signUp';
import MainLayout from './layout/main-layout';
import routes, { routesUser } from './routes';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/sign-up' element={<SignUpPage />} />
                <Route path='/login' element={<SignIn />} />
                <Route path='/' element={<MainLayout />}>
                    {routes.map((item, index) => {
                        let Comp;
                        if (item.component) {
                            Comp = item.component;
                        }

                        return (
                            <Route
                                key={index}
                                path={item.path}
                                element={<Comp />}
                            ></Route>
                        );
                    })}
                    ;
                    {routesUser.map((item, index) => {
                        let Comp;
                        if (item.component) {
                            Comp = item.component;
                        }

                        return (
                            <Route
                                key={index}
                                path={item.path}
                                element={<Comp />}
                            ></Route>
                        );
                    })}
                    ;
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
export default App;
