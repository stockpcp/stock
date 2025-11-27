#!/usr/bin/env python3
"""
Servidor HTTP simples para servir arquivos estáticos
Porta: 8001
"""
import http.server
import socketserver
import os
from pathlib import Path

PORT = 8000

class NoCacheHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Desabilitar cache para facilitar desenvolvimento
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        self.send_header('Expires', '0')
        return super().end_headers()

# Mudar para o diretório do script
script_dir = Path(__file__).parent.absolute()
os.chdir(script_dir)

print("=" * 70)
print("🚀 SERVIDOR HTTP - SITE REPINSTOCK")
print("=" * 70)
print(f"\n📁 Diretório: {script_dir}")
print(f"🌐 Porta: {PORT}")
print("\n✅ ACESSE O SITE EM:")
print(f"   → http://localhost:{PORT}/")
print("\n📄 PÁGINAS DISPONÍVEIS:")
print(f"   • Home:            http://localhost:{PORT}/index.html")
print(f"   • Produtos:        http://localhost:{PORT}/entenda-produtos.html")
print(f"   • Estoque:         http://localhost:{PORT}/estoque.html")
print("\n⏹️  Pressione Ctrl+C para parar o servidor")
print("=" * 70)
print()

# Criar e iniciar o servidor
try:
    with socketserver.TCPServer(("", PORT), NoCacheHTTPRequestHandler) as httpd:
        httpd.serve_forever()
except KeyboardInterrupt:
    print("\n\n🛑 Servidor encerrado pelo usuário")
    print("✅ Até logo!")
except Exception as e:
    print(f"\n❌ Erro ao iniciar servidor: {e}")
    print("\n💡 Dica: Verifique se a porta 8001 já está em uso")
