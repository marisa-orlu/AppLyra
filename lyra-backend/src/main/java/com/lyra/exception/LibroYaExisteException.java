package com.lyra.exception;

public class LibroYaExisteException extends RuntimeException {
    public LibroYaExisteException(String mensaje) {
        super(mensaje);
    }
}
