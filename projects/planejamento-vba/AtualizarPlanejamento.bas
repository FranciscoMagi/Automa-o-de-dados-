Attribute VB_Name = "PlanejamentoDemo"
Option Explicit

Public Sub AtualizarPlanejamento()
    Dim wb As Workbook
    Dim wsEntrada As Worksheet
    Dim wsSaida As Worksheet
    Dim tabela As ListObject
    Dim linha As ListRow
    Dim destino As Long
    Dim statusCol As Long
    Dim prazoCol As Long
    Dim oldScreenUpdating As Boolean

    On Error GoTo TrataErro
    Set wb = ThisWorkbook
    Set wsEntrada = wb.Worksheets("Entrada")
    Set tabela = wsEntrada.ListObjects("tbOrdens")
    statusCol = tabela.ListColumns("status").Index
    prazoCol = tabela.ListColumns("data_prevista").Index

    On Error Resume Next
    Set wsSaida = wb.Worksheets("Planejamento")
    On Error GoTo TrataErro
    If wsSaida Is Nothing Then
        Set wsSaida = wb.Worksheets.Add(After:=wb.Worksheets(wb.Worksheets.Count))
        wsSaida.Name = "Planejamento"
    End If

    oldScreenUpdating = Application.ScreenUpdating
    Application.ScreenUpdating = False
    wsSaida.Cells.Clear
    tabela.HeaderRowRange.Copy Destination:=wsSaida.Range("A1")
    destino = 2

    If Not tabela.DataBodyRange Is Nothing Then
        For Each linha In tabela.ListRows
            If LCase$(Trim$(CStr(linha.Range.Cells(1, statusCol).Value))) <> LCase$("Concluída") Then
                linha.Range.Copy Destination:=wsSaida.Cells(destino, 1)
                destino = destino + 1
            End If
        Next linha
    End If

    If destino > 2 Then
        With wsSaida.Sort
            .SortFields.Clear
            .SortFields.Add Key:=wsSaida.Range(wsSaida.Cells(2, prazoCol), wsSaida.Cells(destino - 1, prazoCol)), _
                SortOn:=xlSortOnValues, Order:=xlAscending, DataOption:=xlSortNormal
            .SetRange wsSaida.Range(wsSaida.Cells(1, 1), wsSaida.Cells(destino - 1, tabela.ListColumns.Count))
            .Header = xlYes
            .Apply
        End With
    End If

    wsSaida.Columns.AutoFit
    Application.ScreenUpdating = oldScreenUpdating
    MsgBox CStr(destino - 2) & " itens abertos enviados para Planejamento.", vbInformation
    Exit Sub

TrataErro:
    Application.ScreenUpdating = oldScreenUpdating
    MsgBox "Não foi possível atualizar o planejamento: " & Err.Description, vbExclamation
End Sub

