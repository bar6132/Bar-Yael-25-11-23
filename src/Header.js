import React, { useEffect } from "react";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { useState } from "react";
import Offcanvas from "react-bootstrap/Offcanvas";
import { ReactComponent as FAV } from "./Assets/SVG/favorite-svgrepo-com.svg";
import weatherIcons from "./WeatheIcons.js";


function Header() {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const [favorites, setFavorites] = useState([]);

  const toggleShow = () => setShow((s) => !s);
  useEffect(() => {
    const favoritesFromStorage =
      JSON.parse(localStorage.getItem("favorites")) || [];
    setFavorites(favoritesFromStorage);
  }, []);

  return (
    <>
      <Navbar expand="lg" className="bg-body-tertiary">
        <Container fluid>
          <Navbar.Brand href="/">Weather-API</Navbar.Brand>
          <div style={{ marginRight: "20px" }}>
            <Button variant="primary" onClick={toggleShow} className="ms-1">
              <FAV />
            </Button>

            <Offcanvas show={show} onHide={handleClose} placement="end">
              <Offcanvas.Header closeButton>
                <Offcanvas.Title>Favorite Places</Offcanvas.Title>
              </Offcanvas.Header>
              <Offcanvas.Body>
                {favorites.length > 0 ? (
                  favorites.map((favorite, index) => (
                    <div key={index}>
                      <p>{favorite.cityName}</p>
                      <p>Temperature: {favorite.temperature}</p>
                      <p>Weather: {favorite.weatherText}</p>
                      {weatherIcons[favorite.weatherText] && (
                        <img
                          src={weatherIcons[favorite.weatherText]}
                          alt={favorite.weatherText}
                          style={{ width: '50px', height: '50px', borderRadius: '50%' }}
                        />
                      )}
                      <hr />
                    </div>
                  ))
                ) : (
                  <p>No favorite places yet.</p>
                )}
              </Offcanvas.Body>
            </Offcanvas>
          </div>
        </Container>
      </Navbar>
    </>
  );
}


export default Header;


