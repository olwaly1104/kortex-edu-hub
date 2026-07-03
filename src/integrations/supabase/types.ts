export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_state: {
        Row: {
          created_at: string
          onboarding: Json | null
          profile: Json | null
          progress: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          onboarding?: Json | null
          profile?: Json | null
          progress?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          onboarding?: Json | null
          profile?: Json | null
          progress?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      agendamentos_gap: {
        Row: {
          assunto: string
          created_at: string
          data_hora: string
          estado: string
          estudante_id: string
          id: string
          notas: string | null
          owner_user_id: string
          updated_at: string
        }
        Insert: {
          assunto: string
          created_at?: string
          data_hora: string
          estado?: string
          estudante_id: string
          id?: string
          notas?: string | null
          owner_user_id: string
          updated_at?: string
        }
        Update: {
          assunto?: string
          created_at?: string
          data_hora?: string
          estado?: string
          estudante_id?: string
          id?: string
          notas?: string | null
          owner_user_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agendamentos_gap_estudante_id_fkey"
            columns: ["estudante_id"]
            isOneToOne: false
            referencedRelation: "estudantes"
            referencedColumns: ["id"]
          },
        ]
      }
      ano_letivo_eventos: {
        Row: {
          ano_letivo: string
          created_at: string
          epoca: string | null
          fim: string
          id: string
          inicio: string
          institution_id: string | null
          owner_user_id: string
          semestre: string | null
          tipo: string
          titulo: string
          updated_at: string
        }
        Insert: {
          ano_letivo: string
          created_at?: string
          epoca?: string | null
          fim: string
          id?: string
          inicio: string
          institution_id?: string | null
          owner_user_id?: string
          semestre?: string | null
          tipo: string
          titulo: string
          updated_at?: string
        }
        Update: {
          ano_letivo?: string
          created_at?: string
          epoca?: string | null
          fim?: string
          id?: string
          inicio?: string
          institution_id?: string | null
          owner_user_id?: string
          semestre?: string | null
          tipo?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      anuncios: {
        Row: {
          author: string | null
          content: string
          created_at: string
          id: string
          institution_id: string
          owner_user_id: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          author?: string | null
          content: string
          created_at?: string
          id?: string
          institution_id: string
          owner_user_id: string
          title: string
          type?: string
          updated_at?: string
        }
        Update: {
          author?: string | null
          content?: string
          created_at?: string
          id?: string
          institution_id?: string
          owner_user_id?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      cadeiras: {
        Row: {
          ano: number
          created_at: string
          curso_id: string
          docente: string | null
          ects: number
          id: string
          name: string
          ordem: number
          owner_user_id: string
          semestre: string
          updated_at: string
        }
        Insert: {
          ano: number
          created_at?: string
          curso_id: string
          docente?: string | null
          ects?: number
          id?: string
          name: string
          ordem?: number
          owner_user_id: string
          semestre?: string
          updated_at?: string
        }
        Update: {
          ano?: number
          created_at?: string
          curso_id?: string
          docente?: string | null
          ects?: number
          id?: string
          name?: string
          ordem?: number
          owner_user_id?: string
          semestre?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cadeiras_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
        ]
      }
      calendario_events: {
        Row: {
          categoria: string | null
          color: string
          created_at: string
          end_time: string | null
          event_date: string
          id: string
          institution_id: string | null
          link: string | null
          location: string | null
          modalidade: string | null
          owner_user_id: string
          participants: Json
          start_time: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          categoria?: string | null
          color: string
          created_at?: string
          end_time?: string | null
          event_date: string
          id?: string
          institution_id?: string | null
          link?: string | null
          location?: string | null
          modalidade?: string | null
          owner_user_id?: string
          participants?: Json
          start_time: string
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          categoria?: string | null
          color?: string
          created_at?: string
          end_time?: string | null
          event_date?: string
          id?: string
          institution_id?: string | null
          link?: string | null
          location?: string | null
          modalidade?: string | null
          owner_user_id?: string
          participants?: Json
          start_time?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      candidaturas: {
        Row: {
          created_at: string
          curso_pretendido: string | null
          documentos: Json
          email: string
          estado: string
          faculdade: string | null
          id: string
          institution_id: string | null
          nome: string
          notas: string | null
          origem: string
          pagamento_status: string
          sessao: string | null
          telefone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          curso_pretendido?: string | null
          documentos?: Json
          email: string
          estado?: string
          faculdade?: string | null
          id?: string
          institution_id?: string | null
          nome: string
          notas?: string | null
          origem?: string
          pagamento_status?: string
          sessao?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          curso_pretendido?: string | null
          documentos?: Json
          email?: string
          estado?: string
          faculdade?: string | null
          id?: string
          institution_id?: string | null
          nome?: string
          notas?: string | null
          origem?: string
          pagamento_status?: string
          sessao?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      candidaturas_estados: {
        Row: {
          color: string
          created_at: string
          descricao: string | null
          id: string
          institution_id: string | null
          is_default: boolean
          key: string
          label: string
          ordem: number
          owner_user_id: string
          updated_at: string
        }
        Insert: {
          color?: string
          created_at?: string
          descricao?: string | null
          id?: string
          institution_id?: string | null
          is_default?: boolean
          key: string
          label: string
          ordem?: number
          owner_user_id: string
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          descricao?: string | null
          id?: string
          institution_id?: string | null
          is_default?: boolean
          key?: string
          label?: string
          ordem?: number
          owner_user_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      candidaturas_etapas: {
        Row: {
          agenda: boolean
          created_at: string
          estados_possiveis: string[]
          id: string
          institution_id: string | null
          nome: string
          obrigatoria: boolean
          ordem: number
          owner_user_id: string
          updated_at: string
        }
        Insert: {
          agenda?: boolean
          created_at?: string
          estados_possiveis?: string[]
          id?: string
          institution_id?: string | null
          nome: string
          obrigatoria?: boolean
          ordem?: number
          owner_user_id: string
          updated_at?: string
        }
        Update: {
          agenda?: boolean
          created_at?: string
          estados_possiveis?: string[]
          id?: string
          institution_id?: string | null
          nome?: string
          obrigatoria?: boolean
          ordem?: number
          owner_user_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      candidaturas_janela: {
        Row: {
          ano_letivo: string
          created_at: string
          fim: string
          id: string
          inicio: string
          institution_id: string | null
          owner_user_id: string
          updated_at: string
        }
        Insert: {
          ano_letivo: string
          created_at?: string
          fim: string
          id?: string
          inicio: string
          institution_id?: string | null
          owner_user_id: string
          updated_at?: string
        }
        Update: {
          ano_letivo?: string
          created_at?: string
          fim?: string
          id?: string
          inicio?: string
          institution_id?: string | null
          owner_user_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      candidaturas_sessoes: {
        Row: {
          capacidade: number | null
          created_at: string
          data_fim: string | null
          datas: string[]
          etapa_id: string
          hora: string | null
          horas: string[]
          id: string
          institution_id: string | null
          local: string | null
          mode: string
          owner_user_id: string
          responsavel_id: string | null
          updated_at: string
        }
        Insert: {
          capacidade?: number | null
          created_at?: string
          data_fim?: string | null
          datas?: string[]
          etapa_id: string
          hora?: string | null
          horas?: string[]
          id?: string
          institution_id?: string | null
          local?: string | null
          mode?: string
          owner_user_id: string
          responsavel_id?: string | null
          updated_at?: string
        }
        Update: {
          capacidade?: number | null
          created_at?: string
          data_fim?: string | null
          datas?: string[]
          etapa_id?: string
          hora?: string | null
          horas?: string[]
          id?: string
          institution_id?: string | null
          local?: string | null
          mode?: string
          owner_user_id?: string
          responsavel_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidaturas_sessoes_etapa_id_fkey"
            columns: ["etapa_id"]
            isOneToOne: false
            referencedRelation: "candidaturas_etapas"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          joined_at: string
          last_read_at: string | null
          user_id: string
        }
        Insert: {
          conversation_id: string
          joined_at?: string
          last_read_at?: string | null
          user_id: string
        }
        Update: {
          conversation_id?: string
          joined_at?: string
          last_read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_group: boolean
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_group?: boolean
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_group?: boolean
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      cursos: {
        Row: {
          code: string
          coordenador: string | null
          created_at: string
          estudantes_esperados: number
          faculdade_id: string
          id: string
          name: string
          owner_user_id: string
          updated_at: string
          years: number
        }
        Insert: {
          code: string
          coordenador?: string | null
          created_at?: string
          estudantes_esperados?: number
          faculdade_id: string
          id?: string
          name: string
          owner_user_id: string
          updated_at?: string
          years?: number
        }
        Update: {
          code?: string
          coordenador?: string | null
          created_at?: string
          estudantes_esperados?: number
          faculdade_id?: string
          id?: string
          name?: string
          owner_user_id?: string
          updated_at?: string
          years?: number
        }
        Relationships: [
          {
            foreignKeyName: "cursos_faculdade_id_fkey"
            columns: ["faculdade_id"]
            isOneToOne: false
            referencedRelation: "faculdades"
            referencedColumns: ["id"]
          },
        ]
      }
      departamentos: {
        Row: {
          cor: string | null
          created_at: string
          designacao: string
          id: string
          owner_user_id: string
          responsavel: string | null
          sigla: string
          updated_at: string
        }
        Insert: {
          cor?: string | null
          created_at?: string
          designacao: string
          id?: string
          owner_user_id: string
          responsavel?: string | null
          sigla: string
          updated_at?: string
        }
        Update: {
          cor?: string | null
          created_at?: string
          designacao?: string
          id?: string
          owner_user_id?: string
          responsavel?: string | null
          sigla?: string
          updated_at?: string
        }
        Relationships: []
      }
      docentes: {
        Row: {
          anos_experiencia: string | null
          bilhete: string | null
          bilhete_file_name: string | null
          cargo: string | null
          categoria: string | null
          contacto: string | null
          contrato: string | null
          created_at: string
          cv_file_name: string | null
          departamento: string | null
          diploma_file_name: string | null
          email: string | null
          endereco: string | null
          especialidade: string | null
          faculdade: string | null
          foto_data_url: string | null
          genero: string | null
          grau: string | null
          id: string
          instituicao_formacao: string | null
          modulo_kortex: string | null
          municipio: string | null
          nascimento: string | null
          owner_user_id: string
          prefixo: string | null
          primeiro_nome: string
          provincia: string | null
          ultimo_nome: string
          updated_at: string
        }
        Insert: {
          anos_experiencia?: string | null
          bilhete?: string | null
          bilhete_file_name?: string | null
          cargo?: string | null
          categoria?: string | null
          contacto?: string | null
          contrato?: string | null
          created_at?: string
          cv_file_name?: string | null
          departamento?: string | null
          diploma_file_name?: string | null
          email?: string | null
          endereco?: string | null
          especialidade?: string | null
          faculdade?: string | null
          foto_data_url?: string | null
          genero?: string | null
          grau?: string | null
          id?: string
          instituicao_formacao?: string | null
          modulo_kortex?: string | null
          municipio?: string | null
          nascimento?: string | null
          owner_user_id: string
          prefixo?: string | null
          primeiro_nome: string
          provincia?: string | null
          ultimo_nome: string
          updated_at?: string
        }
        Update: {
          anos_experiencia?: string | null
          bilhete?: string | null
          bilhete_file_name?: string | null
          cargo?: string | null
          categoria?: string | null
          contacto?: string | null
          contrato?: string | null
          created_at?: string
          cv_file_name?: string | null
          departamento?: string | null
          diploma_file_name?: string | null
          email?: string | null
          endereco?: string | null
          especialidade?: string | null
          faculdade?: string | null
          foto_data_url?: string | null
          genero?: string | null
          grau?: string | null
          id?: string
          instituicao_formacao?: string | null
          modulo_kortex?: string | null
          municipio?: string | null
          nascimento?: string | null
          owner_user_id?: string
          prefixo?: string | null
          primeiro_nome?: string
          provincia?: string | null
          ultimo_nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      edificios: {
        Row: {
          created_at: string
          id: string
          nome: string
          owner_user_id: string
          pisos: number
          responsavel: string | null
          salas: number
          sigla: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          nome: string
          owner_user_id: string
          pisos?: number
          responsavel?: string | null
          salas?: number
          sigla: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
          owner_user_id?: string
          pisos?: number
          responsavel?: string | null
          salas?: number
          sigla?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "edificios_responsavel_fkey"
            columns: ["responsavel"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      estudantes: {
        Row: {
          ano: string
          bilhete: string | null
          bilhete_url: string | null
          certificado_url: string | null
          created_at: string
          curso_id: string
          email: string
          enc_bilhete_url: string | null
          enc_nome: string | null
          enc_parentesco: string | null
          enc_telefone: string | null
          endereco: string | null
          foto_url: string | null
          genero: string | null
          id: string
          municipio: string | null
          nacionalidade: string | null
          nascimento: string | null
          nome: string
          origem: string
          owner_user_id: string
          primeiro_nome: string | null
          provincia: string | null
          regime: string
          telemovel: string | null
          turma: string
          ultimo_nome: string | null
          updated_at: string
        }
        Insert: {
          ano?: string
          bilhete?: string | null
          bilhete_url?: string | null
          certificado_url?: string | null
          created_at?: string
          curso_id: string
          email: string
          enc_bilhete_url?: string | null
          enc_nome?: string | null
          enc_parentesco?: string | null
          enc_telefone?: string | null
          endereco?: string | null
          foto_url?: string | null
          genero?: string | null
          id?: string
          municipio?: string | null
          nacionalidade?: string | null
          nascimento?: string | null
          nome: string
          origem?: string
          owner_user_id: string
          primeiro_nome?: string | null
          provincia?: string | null
          regime?: string
          telemovel?: string | null
          turma?: string
          ultimo_nome?: string | null
          updated_at?: string
        }
        Update: {
          ano?: string
          bilhete?: string | null
          bilhete_url?: string | null
          certificado_url?: string | null
          created_at?: string
          curso_id?: string
          email?: string
          enc_bilhete_url?: string | null
          enc_nome?: string | null
          enc_parentesco?: string | null
          enc_telefone?: string | null
          endereco?: string | null
          foto_url?: string | null
          genero?: string | null
          id?: string
          municipio?: string | null
          nacionalidade?: string | null
          nascimento?: string | null
          nome?: string
          origem?: string
          owner_user_id?: string
          primeiro_nome?: string | null
          provincia?: string | null
          regime?: string
          telemovel?: string | null
          turma?: string
          ultimo_nome?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "estudantes_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
        ]
      }
      faculdades: {
        Row: {
          color: string
          created_at: string
          decano: string | null
          id: string
          name: string
          owner_user_id: string
          sigla: string | null
          updated_at: string
        }
        Insert: {
          color?: string
          created_at?: string
          decano?: string | null
          id?: string
          name: string
          owner_user_id: string
          sigla?: string | null
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          decano?: string | null
          id?: string
          name?: string
          owner_user_id?: string
          sigla?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      fin_despesa_categorias: {
        Row: {
          cor: string
          created_at: string
          documentos: Json
          id: string
          nome: string
          owner_user_id: string
          updated_at: string
        }
        Insert: {
          cor?: string
          created_at?: string
          documentos?: Json
          id?: string
          nome: string
          owner_user_id: string
          updated_at?: string
        }
        Update: {
          cor?: string
          created_at?: string
          documentos?: Json
          id?: string
          nome?: string
          owner_user_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      fin_solicitacoes: {
        Row: {
          anexos: Json
          created_at: string
          description: string | null
          destinatario: string | null
          destinatario_user_id: string | null
          direction: string
          due_date: string | null
          historico: Json
          id: string
          institution_id: string
          prazo_ate: string | null
          prazo_de: string | null
          ref: string
          requester_matricula: string | null
          requester_name: string | null
          requester_role: string | null
          requester_user_id: string
          responsavel: string | null
          status: string
          title: string
          type: string
          updated_at: string
          valor: number | null
        }
        Insert: {
          anexos?: Json
          created_at?: string
          description?: string | null
          destinatario?: string | null
          destinatario_user_id?: string | null
          direction: string
          due_date?: string | null
          historico?: Json
          id?: string
          institution_id: string
          prazo_ate?: string | null
          prazo_de?: string | null
          ref: string
          requester_matricula?: string | null
          requester_name?: string | null
          requester_role?: string | null
          requester_user_id: string
          responsavel?: string | null
          status?: string
          title: string
          type: string
          updated_at?: string
          valor?: number | null
        }
        Update: {
          anexos?: Json
          created_at?: string
          description?: string | null
          destinatario?: string | null
          destinatario_user_id?: string | null
          direction?: string
          due_date?: string | null
          historico?: Json
          id?: string
          institution_id?: string
          prazo_ate?: string | null
          prazo_de?: string | null
          ref?: string
          requester_matricula?: string | null
          requester_name?: string | null
          requester_role?: string | null
          requester_user_id?: string
          responsavel?: string | null
          status?: string
          title?: string
          type?: string
          updated_at?: string
          valor?: number | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          body: string
          conversation_id: string
          created_at: string
          id: string
          read_at: string | null
          sender_id: string
        }
        Insert: {
          body: string
          conversation_id: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id: string
        }
        Update: {
          body?: string
          conversation_id?: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      module_settings: {
        Row: {
          config: Json
          created_at: string
          enabled: boolean
          id: string
          institution_id: string
          modulo: string
          updated_at: string
        }
        Insert: {
          config?: Json
          created_at?: string
          enabled?: boolean
          id?: string
          institution_id: string
          modulo: string
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          enabled?: boolean
          id?: string
          institution_id?: string
          modulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      orcamentos: {
        Row: {
          created_at: string
          department: string
          id: string
          name: string
          owner_user_id: string
          period: string
          responsavel: string
          responsavel_role: string
          spent: number
          status: string
          total_budget: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          department?: string
          id?: string
          name: string
          owner_user_id: string
          period?: string
          responsavel?: string
          responsavel_role?: string
          spent?: number
          status?: string
          total_budget?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          department?: string
          id?: string
          name?: string
          owner_user_id?: string
          period?: string
          responsavel?: string
          responsavel_role?: string
          spent?: number
          status?: string
          total_budget?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string
          email: string | null
          id: string
          institution_id: string | null
          last_seen_at: string | null
          must_change_password: boolean
          nif: string | null
          nome_legal: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name: string
          email?: string | null
          id: string
          institution_id?: string | null
          last_seen_at?: string | null
          must_change_password?: boolean
          nif?: string | null
          nome_legal?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string
          email?: string | null
          id?: string
          institution_id?: string | null
          last_seen_at?: string | null
          must_change_password?: boolean
          nif?: string | null
          nome_legal?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      propinas: {
        Row: {
          created_at: string
          curso_id: string
          id: string
          imposto: number
          owner_user_id: string
          updated_at: string
          valor_mensal: number
        }
        Insert: {
          created_at?: string
          curso_id: string
          id?: string
          imposto?: number
          owner_user_id: string
          updated_at?: string
          valor_mensal?: number
        }
        Update: {
          created_at?: string
          curso_id?: string
          id?: string
          imposto?: number
          owner_user_id?: string
          updated_at?: string
          valor_mensal?: number
        }
        Relationships: [
          {
            foreignKeyName: "propinas_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: true
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
        ]
      }
      solicitacoes_gap: {
        Row: {
          assunto: string
          created_at: string
          descricao: string | null
          estado: string
          estudante_id: string
          id: string
          owner_user_id: string
          updated_at: string
        }
        Insert: {
          assunto: string
          created_at?: string
          descricao?: string | null
          estado?: string
          estudante_id: string
          id?: string
          owner_user_id: string
          updated_at?: string
        }
        Update: {
          assunto?: string
          created_at?: string
          descricao?: string | null
          estado?: string
          estudante_id?: string
          id?: string
          owner_user_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "solicitacoes_gap_estudante_id_fkey"
            columns: ["estudante_id"]
            isOneToOne: false
            referencedRelation: "estudantes"
            referencedColumns: ["id"]
          },
        ]
      }
      staff: {
        Row: {
          contacto: string | null
          created_at: string
          departamento: string | null
          email: string | null
          funcao: string | null
          id: string
          modulo_kortex: string | null
          owner_user_id: string
          prefixo: string | null
          primeiro_nome: string
          ultimo_nome: string
          updated_at: string
        }
        Insert: {
          contacto?: string | null
          created_at?: string
          departamento?: string | null
          email?: string | null
          funcao?: string | null
          id?: string
          modulo_kortex?: string | null
          owner_user_id: string
          prefixo?: string | null
          primeiro_nome: string
          ultimo_nome: string
          updated_at?: string
        }
        Update: {
          contacto?: string | null
          created_at?: string
          departamento?: string | null
          email?: string | null
          funcao?: string | null
          id?: string
          modulo_kortex?: string | null
          owner_user_id?: string
          prefixo?: string | null
          primeiro_nome?: string
          ultimo_nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      turmas: {
        Row: {
          ano: string
          capacidade: number
          created_at: string
          curso_id: string
          id: string
          letra: string
          owner_user_id: string
          sala: string | null
          turno: string | null
          updated_at: string
        }
        Insert: {
          ano: string
          capacidade?: number
          created_at?: string
          curso_id: string
          id?: string
          letra: string
          owner_user_id?: string
          sala?: string | null
          turno?: string | null
          updated_at?: string
        }
        Update: {
          ano?: string
          capacidade?: number
          created_at?: string
          curso_id?: string
          id?: string
          letra?: string
          owner_user_id?: string
          sala?: string | null
          turno?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "turmas_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_institution_id: { Args: never; Returns: string }
      get_institution_fiscal: {
        Args: never
        Returns: {
          nif: string
          nome_legal: string
        }[]
      }
      get_last_seen: { Args: { _user_id: string }; Returns: string }
      get_or_create_dm: { Args: { _other_user_id: string }; Returns: string }
      get_user_name: { Args: { _user_id: string }; Returns: string }
      get_users_presence: {
        Args: { _ids: string[] }
        Returns: {
          id: string
          last_seen_at: string
          role: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_conversation_participant: {
        Args: { _conversation_id: string; _user_id: string }
        Returns: boolean
      }
      list_institution_contacts: {
        Args: never
        Returns: {
          display_name: string
          email: string
          id: string
          modulo: string
        }[]
      }
      mark_conversation_read: {
        Args: { _conversation_id: string }
        Returns: undefined
      }
      set_institution_fiscal: {
        Args: { _nif: string; _nome_legal: string }
        Returns: undefined
      }
      touch_last_seen: { Args: never; Returns: undefined }
    }
    Enums: {
      app_role:
        | "admin"
        | "estudante"
        | "professor"
        | "coordenador"
        | "decano"
        | "reitor"
        | "financas"
        | "academica"
        | "gap"
        | "inscricoes"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "admin",
        "estudante",
        "professor",
        "coordenador",
        "decano",
        "reitor",
        "financas",
        "academica",
        "gap",
        "inscricoes",
      ],
    },
  },
} as const
