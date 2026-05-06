package com.lyra.model;

public enum EstadoPrestamo {
    PENDIENTE(1),
    ACEPTADO(2),
    RECHAZADO(3),
    DEVUELTO(4),
    PENDIENTE_DEVOLUCION(5);

    private final int valor;

    EstadoPrestamo(int valor) {
        this.valor = valor;
    }

    public int getValor() {
        return valor;
    }

    public static EstadoPrestamo fromValor(int valor) {
        for (EstadoPrestamo estado : EstadoPrestamo.values()) {
            if (estado.getValor() == valor) {
                return estado;
            }
        }
        return null;
    }
}
