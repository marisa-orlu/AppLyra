package com.lyra.model;

public enum EstadoLibro {
    LEIDO(1),
    LEYENDO(2),
    PENDIENTE(3);
    private final int valor;

    EstadoLibro(int valor) {
        this.valor = valor;
    }

    public int getValor() {
        return valor;
    }

    public static EstadoLibro fromValor(int valor) {
        for (EstadoLibro estado : EstadoLibro.values()) {
            if (estado.getValor() == valor) {
                return estado;
            }
        }
        return null;
    }
}
