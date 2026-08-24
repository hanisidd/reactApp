import Navbar from "../components/Navbar";

function Dashboard() {

    return (
        <div className="min-h-screen bg-gray-50">

            <Navbar />

            <main className="p-6">

                <h1 className="text-3xl font-bold">
                    Dashboard
                </h1>

                <p className="mt-2 text-gray-600">
                    Welcome to the admin panel.
                </p>

            </main>

        </div>
    );
}

export default Dashboard;