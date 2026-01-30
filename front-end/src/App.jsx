import { FoldersList } from "./components/folders-list/FoldersList";
import { Layout } from "./components/layout/Layout";
import { Loader } from "./components/loader/Loader";
import { Outlet, useNavigation } from "react-router-dom";

export function App() {
    const { state, formMethod } = useNavigation();
    const isLoading = (state === "loading" || state === "submitting") && formMethod !== "patch";
    return (
        <Layout>
            {isLoading && <Loader />}
            <FoldersList />
            <Outlet />
        </Layout>
    );
}
