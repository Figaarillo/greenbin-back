/**
 * Estado de un cupón para un vecino concreto, resuelto por la policy de canje.
 *
 * Es lo que viaja al front: la pantalla pinta `reason` y deshabilita la tarjeta
 * sin saber NADA de la regla. Cuando la regla cambie (límites configurables por
 * local), cambia la policy y el front no se toca.
 */
interface Redeemability {
  redeemable: boolean
  /** Motivo listo para mostrarle al vecino. Solo presente si redeemable es false. */
  reason?: string
}

export default Redeemability
