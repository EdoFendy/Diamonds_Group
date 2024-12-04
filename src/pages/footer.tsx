import { Coins } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-black/80 border-t border-yellow-600/50">
      <div className="container mx-auto px-4 md:px-6 py-16">
        <div className="flex flex-col items-center space-y-8">
          {/* Sezione Aziendale */}
          <div className="space-y-4 text-center">
            <div className="flex items-center justify-center space-x-2">
              <Coins className="h-6 w-6 text-yellow-400" />
              <span className="font-bold text-lg text-white">U-WIN Network</span>
            </div>
            <p className="text-sm text-gray-400">
              Trasformiamo il futuro della finanza attraverso tecnologie blockchain innovative e soluzioni DeFi.
            </p>
          </div>

          {/* Eventuali Altre Informazioni (Opzionale) */}
          {/* <div className="space-y-2">
            <p className="text-sm text-gray-400">Eventuali altre informazioni o link esterni</p>
          </div> */}
        </div>

        {/* Sezione Copyright */}
        <div className="mt-12 pt-8 border-t border-yellow-600/50 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} Diamonds-Group. Tutti i diritti riservati.</p>
        </div>
      </div>
    </footer>
  );
}
