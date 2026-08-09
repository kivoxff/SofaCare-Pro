import { Container } from "react-bootstrap"
import { Navigation } from "./Navigation"
import { Footer } from "./Footer"

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <Container fluid className="bg-light min-vh-100 p-0">
            {/* Navbar */}
            <Navigation />

            {children}

            {/* Footer */}
            <Footer />

        </Container>
    )
}